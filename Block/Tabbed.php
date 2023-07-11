<?php
/**
 * Copyright (c) 2023 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

namespace HawkSearch\Proxy\Block;

use HawkSearch\Connector\Gateway\InstructionException;
use HawkSearch\Proxy\Api\Data\SearchResultContentItemInterface;
use HawkSearch\Proxy\Helper\Data as ProxyHelper;
use HawkSearch\Proxy\Model\Config\Proxy as ProxyConfigProvider;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\Exception\NotFoundException;
use Magento\Framework\View\Element\Template;

class Tabbed extends Html
{
    /**
     * @var ProxyHelper
     */
    private $helper;

    /**
     * @var string
     */
    private $labelMap;

    /**
     * @var int
     */
    public static $increment = 1;

    /**
     * @var ProxyConfigProvider
     */
    private $proxyConfigProvider;

    /**
     * Tabbed constructor.
     * @param Template\Context $context
     * @param ProxyHelper $helper
     * @param BannerFactory $bannerFactory
     * @param ProxyConfigProvider $proxyConfigProvider
     * @param array $data
     */
    public function __construct(
        Template\Context $context,
        ProxyHelper $helper,
        BannerFactory $bannerFactory,
        ProxyConfigProvider $proxyConfigProvider,
        array $data = []
    ) {
        parent::__construct($context, $helper, $bannerFactory, $data);
        $this->helper = $helper;
        $this->proxyConfigProvider = $proxyConfigProvider;
    }

    /**
     * @return string|null
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getTabs()
    {
        return $this->helper->getResultData()->getResponseData()->getTabs() ?? null;
    }

    /**
     * @return SearchResultContentItemInterface[]
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getContent()
    {
        return $this->helper->getResultData()->getResponseData()->getResults()->getItems();
    }

    /**
     * @param SearchResultContentItemInterface $item
     * @return mixed
     * @throws NoSuchEntityException
     */
    public function getTabbedItemHtml($item)
    {
        $rendererList = $this->getChildBlock('item.renderers');
        $type = 'default';
        if ($this->proxyConfigProvider->showTypeLabels()
            && $this->getRequest()->getParam('it') != 'all' && isset($item->getCustom()['it'])) {
            $type = strstr($item->getCustom()['it'], '|^|', true);
        }

        $renderer = $rendererList->getRenderer($type, 'default');
        $renderer->_viewVars = ['item' => $item];
        return $renderer->toHtml();
    }

    /**
     * @return int
     */
    public function getIncrement()
    {
        return self::$increment++;
    }

    /**
     * @param SearchResultContentItemInterface $item
     * @return string
     * @throws InstructionException
     * @throws NoSuchEntityException
     * @throws NotFoundException
     */
    public function getTypeLabel($item)
    {
        if (!$this->proxyConfigProvider->showTypeLabels() || !isset($item->getCustom()['it'])) {
            return '';
        }
        if (!$this->labelMap) {
            $this->labelMap = $this->helper->getTypeLabelMap();
        }
        $type = explode('|^|', $item->getCustom()['it'])[0] ?? '';

        if (!isset($this->labelMap[$type])) {
            preg_match_all('/tab="(.*?)"/', $this->getTabs(), $matches);
            if (count($matches) > 0) {
                foreach ($matches[1] as $foundType) {
                    if ($foundType == 'all' || isset($this->labelMap[$foundType])) {
                        continue;
                    }
                    $obj = new \stdClass();
                    $obj->title = ucfirst((string) $foundType);
                    $obj->code = $foundType;
                    $obj->color = $this->helper->generateColor($foundType);
                    $obj->textColor = $this->helper->generateTextColor($obj->color);
                    $this->labelMap[$foundType] = $obj;
                }
            }
        }

        $bg = $this->labelMap[$type]->color ?? '';
        $label = $this->labelMap[$type]->title ?? '';
        $fg = $this->labelMap[$type]->textColor ?? '';
        return sprintf(
            '<p style="background-color: %s;
padding: 5px 10px; display:inline-block; font-weight: bold; color: %s">%s</p>',
            $bg,
            $fg,
            $label
        );
    }
}
