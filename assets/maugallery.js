(function() {
  function mauGallery(element, options) {
    options = Object.assign({}, mauGallery.defaults, options);
    let tagsCollection = [];

    createRowWrapper(element);
    if (options.lightBox) {
      createLightBox(element, options.lightboxId, options.navigation);
    }
    listeners(element, options);

    const galleryItems = element.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
      responsiveImageItem(item);
      moveItemInRowWrapper(item);
      wrapItemInColumn(item, options.columns);
      const theTag = item.dataset.galleryTag;
      if (options.showTags && theTag !== undefined && !tagsCollection.includes(theTag)) {
        tagsCollection.push(theTag);
      }
    });

    if (options.showTags) {
      showItemTags(element, options.tagsPosition, tagsCollection);
    }

    element.style.display = 'block';
    element.style.opacity = 1;
    element.style.transition = 'opacity 0.5s';
  }

  mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: 'bottom',
    navigation: true
  };

  function listeners(element, options) {
    element.addEventListener('click', (event) => {
        if (options.lightBox && event.target.tagName === 'IMG') {
            openLightBox(event.target, options.lightboxId);
        }
    });

    // Attacher les écouteurs à l'intérieur de la modale
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('nav-link')) {
            filterByTag(event.target);
        } else if (event.target.classList.contains('mg-prev')) {
            console.log('Previous image button clicked');
            prevImage(options.lightboxId);
        } else if (event.target.classList.contains('mg-next')) {
            console.log('Next image button clicked');
            nextImage(options.lightboxId);
        }
    });
  }

  function createRowWrapper(element) {
    if (!element.children[0].classList.contains('row')) {
      const row = document.createElement('div');
      row.classList.add('gallery-items-row', 'row');
      element.appendChild(row);
    }
  }

  function wrapItemInColumn(element, columns) {
    let columnClasses = '';

    if (typeof columns === 'number') {
      columnClasses = `col-${Math.ceil(12 / columns)}`;
    } else if (typeof columns === 'object') {
      if (columns.xs) columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
      if (columns.sm) columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
      if (columns.md) columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
      if (columns.lg) columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
      if (columns.xl) columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
    } else {
      console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
    }

    const wrapper = document.createElement('div');
    wrapper.className = `item-column mb-4 ${columnClasses}`;
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);
  }

  function moveItemInRowWrapper(element) {
    document.querySelector('.gallery-items-row').appendChild(element);
  }

  function responsiveImageItem(element) {
    if (element.tagName === 'IMG') {
      element.classList.add('img-fluid');
    }
  }

  function openLightBox(element, lightboxId) {
    const lightbox = document.getElementById(lightboxId);
    if (lightbox) {
      lightbox.querySelector('.lightboxImage').src = element.src;
      const modal = new bootstrap.Modal(lightbox);
      modal.show();
    }
  }

  function getFilteredImages() {
    const activeTag = document.querySelector('.active-tag').dataset.imagesToggle;
    const galleryItems = document.querySelectorAll('img.gallery-item');
    if (activeTag === 'all') {
      return Array.from(galleryItems);
    } else {
      return Array.from(galleryItems).filter(img => img.dataset.galleryTag === activeTag);
    }
  }

  function prevImage(lightboxId) {
    const lightboxImage = document.querySelector(`#${lightboxId} .lightboxImage`);
    const activeImageSrc = lightboxImage.src;
    const filteredImages = getFilteredImages();
    const currentIndex = filteredImages.findIndex(img => img.src === activeImageSrc);
    const prevIndex = (currentIndex > 0) ? currentIndex - 1 : filteredImages.length - 1;
    lightboxImage.src = filteredImages[prevIndex].src;
  }

  function nextImage(lightboxId) {
    const lightboxImage = document.querySelector(`#${lightboxId} .lightboxImage`);
    const activeImageSrc = lightboxImage.src;
    const filteredImages = getFilteredImages();
    const currentIndex = filteredImages.findIndex(img => img.src === activeImageSrc);
    const nextIndex = (currentIndex < filteredImages.length - 1) ? currentIndex + 1 : 0;
    lightboxImage.src = filteredImages[nextIndex].src;
  }

  function createLightBox(gallery, lightboxId, navigation) {
    const modalHtml = `
      <div class="modal fade" id="${lightboxId ? lightboxId : 'galleryLightbox'}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-body">
              ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;">&#9664;</div>' : '<span style="display:none;" />'}
              <img class="lightboxImage img-fluid" alt="Contenu de l\'image affichée dans la modale au clique"/>
              ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">&#9654;</div>' : '<span style="display:none;" />'}
            </div>
          </div>
        </div>
      </div>`;
    gallery.insertAdjacentHTML('beforeend', modalHtml);
  }

  function showItemTags(gallery, position, tags) {
    let tagItems = '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
    tags.forEach((value) => {
      tagItems += `<li class="nav-item active"><span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
    });
    const tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

    if (position === 'bottom') {
      gallery.insertAdjacentHTML('beforeend', tagsRow);
    } else if (position === 'top') {
      gallery.insertAdjacentHTML('afterbegin', tagsRow);
    } else {
      console.error(`Unknown tags position: ${position}`);
    }
  }

  function filterByTag(target) {
    if (target.classList.contains('active-tag')) {
        return;
    }
    document.querySelector('.active-tag').classList.remove('active', 'active-tag');
    target.classList.add('active', 'active-tag'); //Correction, ajout de la class "active"

    const tag = target.dataset.imagesToggle;
    document.querySelectorAll('.gallery-item').forEach((item) => {
        const parentColumn = item.closest('.item-column');
        parentColumn.style.display = 'none';
        if (tag === 'all' || item.dataset.galleryTag === tag) {
            parentColumn.style.display = 'block';
        }
    });
  }

  window.mauGallery = mauGallery;
})();
